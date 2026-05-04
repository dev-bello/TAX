import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Loader2, CheckCircle2, AlertTriangle, RotateCcw, FileImage } from 'lucide-react';

interface ExtractedReceipt {
  vendor: string;
  date: string;
  amount: number;
  category: string;
  items?: string[];
  confidence: number;
}

interface ReceiptScannerProps {
  onReceiptExtracted?: (receipt: ExtractedReceipt) => void;
  apiKey?: string;
}

// Moonshot AI API endpoint
const MOONSHOT_API_URL = 'https://api.moonshot.ai/v1/chat/completions';

export default function ReceiptScanner({ onReceiptExtracted, apiKey }: ReceiptScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const MOONSHOT_API_KEY = apiKey || process.env.MOONSHOT_API_KEY || 'sk-Ox9DhWOCgmu6eCduQtehi26xKuRlhmgAT6s8oD4NfNJ4npEZ';

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processReceiptWithAI = async (imageBase64: string) => {
    try {
      setIsScanning(true);
      setError(null);

      const systemPrompt = `You are a receipt analysis expert. Extract all relevant information from receipt images and return it in structured JSON format.

Extract the following information:
1. Vendor/Business name
2. Date of purchase (YYYY-MM-DD format)
3. Total amount (just the number)
4. Category (choose from: Office Expenses, Utilities, Transportation, Meals, Professional Services, Asset Purchase, Marketing, Supplies, Miscellaneous)
5. List of items purchased (if visible)
6. Confidence score (0.0-1.0)

Return ONLY valid JSON in this exact format:
{
  "vendor": "Store Name",
  "date": "2026-03-15",
  "amount": 1234.56,
  "category": "Office Expenses",
  "items": ["Item 1", "Item 2"],
  "confidence": 0.95
}

Rules:
- Amount should be the final total including tax
- Date should be in YYYY-MM-DD format
- If any field is unclear, make your best estimate and lower the confidence score
- Category should be the most appropriate business expense category`;

      const response = await fetch(MOONSHOT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOONSHOT_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'moonshot-v1-8k',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Extract the receipt information from this image and return it as JSON:'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageBase64
                  }
                }
              ]
            }
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('Empty response from AI');
      }

      // Extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse receipt data');
      }

      const parsedData = JSON.parse(jsonMatch[0]);
      
      if (parsedData.vendor && parsedData.amount) {
        setExtractedData(parsedData);
        if (onReceiptExtracted) {
          onReceiptExtracted(parsedData);
        }
      } else {
        throw new Error('Incomplete receipt data extracted');
      }
    } catch (err) {
      console.error('Error processing receipt:', err);
      setError(err instanceof Error ? err.message : 'Failed to process receipt. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Please upload an image smaller than 5MB.');
      return;
    }

    // Show preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setExtractedData(null);
    setError(null);
    setIsExpanded(true);

    // Convert and process
    const base64 = await convertImageToBase64(file);
    await processReceiptWithAI(base64);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setIsExpanded(true);
      }
    } catch (err) {
      setError('Could not access camera. Please use file upload instead.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg', 0.9);
        setPreviewUrl(base64);
        stopCamera();
        processReceiptWithAI(base64);
      }
    }
  };

  const handleReset = () => {
    setPreviewUrl(null);
    setExtractedData(null);
    setError(null);
    setCameraActive(false);
    setIsExpanded(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  // Compact view when no active scan/preview
  const isIdle = !cameraActive && !previewUrl && !extractedData && !error && !isScanning;

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-taxfyp border border-outline-variant/15 overflow-hidden">
      {/* Header - always visible */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileImage size={18} className="text-primary" />
          <h3 className="font-bold text-on-surface text-sm">Scan Receipt</h3>
        </div>
        {isIdle && (
          <div className="flex gap-1">
            <button
              onClick={startCamera}
              className="p-1.5 rounded-lg hover:bg-surface-container-low transition-colors"
              title="Take photo"
            >
              <Camera size={16} className="text-primary" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg hover:bg-surface-container-low transition-colors"
              title="Upload image"
            >
              <Upload size={16} className="text-primary" />
            </button>
          </div>
        )}
        {!isIdle && (
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg hover:bg-surface-container-low transition-colors"
            title="Reset"
          >
            <X size={16} className="text-outline" />
          </button>
        )}
      </div>

      {/* Expanded content */}
      {!isIdle && (
        <div className="px-4 pb-4 space-y-3">
          {/* Camera or Preview Area - compact */}
          {(cameraActive || previewUrl) && (
            <div className="relative aspect-video bg-surface-container-low rounded-xl overflow-hidden">
              {cameraActive && (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-3">
                    <button
                      onClick={capturePhoto}
                      className="w-12 h-12 bg-white rounded-full border-4 border-primary flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                    >
                      <div className="w-8 h-8 bg-primary rounded-full" />
                    </button>
                    <button
                      onClick={stopCamera}
                      className="w-9 h-9 bg-error text-white rounded-full flex items-center justify-center shadow-lg"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </>
              )}
              {!cameraActive && previewUrl && (
                <>
                  <img
                    src={previewUrl}
                    alt="Receipt preview"
                    className="absolute inset-0 w-full h-full object-contain bg-black/50"
                  />
                  {isScanning && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                      <p className="text-white text-sm font-medium">Reading receipt...</p>
                    </div>
                  )}
                </>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {/* Idle action buttons when expanded but no preview/camera */}
          {!cameraActive && !previewUrl && (
            <div className="flex gap-3">
              <button
                onClick={startCamera}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-surface-container-low rounded-xl border border-outline-variant/20 hover:border-primary/50 hover:bg-primary-container/10 transition-colors text-sm font-medium"
              >
                <Camera size={16} className="text-primary" />
                Take Photo
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-surface-container-low rounded-xl border border-outline-variant/20 hover:border-primary/50 hover:bg-primary-container/10 transition-colors text-sm font-medium"
              >
                <Upload size={16} className="text-primary" />
                Upload
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Error Message - compact */}
          {error && (
            <div className="bg-error-container/30 border border-error/20 p-3 rounded-xl flex gap-2 items-start">
              <AlertTriangle className="text-error shrink-0 mt-0.5" size={16} />
              <p className="text-xs text-error">{error}</p>
            </div>
          )}

          {/* Extracted Data Preview - compact */}
          {extractedData && (
            <div className="bg-tertiary-container/10 border border-tertiary/20 p-3 rounded-xl">
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="text-tertiary" size={14} />
                <h4 className="font-bold text-tertiary text-sm">Receipt Extracted</h4>
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Vendor:</span>
                  <span className="font-medium text-on-surface">{extractedData.vendor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Date:</span>
                  <span className="font-medium text-on-surface">{extractedData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Category:</span>
                  <span className="font-medium text-on-surface">{extractedData.category}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-tertiary/20">
                  <span className="text-on-surface-variant">Amount:</span>
                  <span className="font-bold text-on-surface">{formatAmount(extractedData.amount)}</span>
                </div>
                {extractedData.confidence < 0.8 && (
                  <p className="text-[10px] text-tertiary">
                    Confidence: {(extractedData.confidence * 100).toFixed(0)}% - Please verify
                  </p>
                )}
              </div>

              <div className="flex gap-2 mt-2">
                <button className="flex-1 bg-primary text-white py-2 rounded-lg font-semibold text-xs hover:opacity-90 transition-opacity">
                  Add to Expenses
                </button>
                <button
                  onClick={handleReset}
                  className="px-3 py-2 border border-outline-variant/30 rounded-lg hover:bg-surface-container-low transition-colors"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
