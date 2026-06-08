const CONTENT_API = (import.meta as any).env?.VITE_HYGRAPH_CONTENT_API;
const PAT = (import.meta as any).env?.VITE_HYGRAPH_PAT;

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export async function hygraphRequest<T = any>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  if (!CONTENT_API) {
    throw new Error('Hygraph Content API not configured');
  }

  const response = await fetch(CONTENT_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(PAT ? { Authorization: `Bearer ${PAT}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const json: GraphQLResponse<T> = await response.json();

  if (json.errors) {
    throw new Error(json.errors[0].message);
  }

  return json.data as T;
}

/* ------------------------------------------------------------------ */
/*  User                                                              */
/* ------------------------------------------------------------------ */

export const GET_USER_BY_EMAIL = `
  query GetUserByEmail($email: String!) {
    userrs(where: { email: $email }, first: 1) {
      id
      email
      name
      password
    }
  }
`;

export const CREATE_USER = `
  mutation CreateUser($email: String!, $password: String!, $name: String!) {
    createUserr(data: { email: $email, password: $password, name: $name }) {
      id
      email
      name
    }
  }
`;

export const PUBLISH_USER = `
  mutation PublishUser($id: ID!) {
    publishUserr(where: { id: $id }, to: PUBLISHED) {
      id
    }
  }
`;

/* ------------------------------------------------------------------ */
/*  Business Profile                                                  */
/* ------------------------------------------------------------------ */

export const GET_BUSINESS_PROFILE = `
  query GetBusinessProfile($userId: ID!) {
    businessProfiles(where: { userr: { id: $userId } }, first: 1) {
      id
      businessName
      businessType
      yearOfIncorporation
      cacNumber
      tin
      sector
      numberOfEmployees
      annualTurnover
      isProfessional
      vatRegistered
      vatNumber
      taxYear
      complianceStatus
      businessAddress
      email
      phoneNumber
      classification
      taxRate
      userr {
        id
      }
    }
  }
`;

export const CREATE_BUSINESS_PROFILE = `
  mutation CreateBusinessProfile(
    $userId: ID!
    $businessName: String!
    $businessType: String
    $yearOfIncorporation: Int
    $cacNumber: String
    $tin: String
    $sector: String
    $numberOfEmployees: Int
    $annualTurnover: Float
    $isProfessional: Boolean
    $vatRegistered: Boolean
    $vatNumber: String
    $taxYear: String
    $complianceStatus: String
    $businessAddress: String
    $email: String
    $phoneNumber: String
    $classification: String
    $taxRate: Int
  ) {
    createBusinessProfile(
      data: {
        userr: { connect: { id: $userId } }
        businessName: $businessName
        businessType: $businessType
        yearOfIncorporation: $yearOfIncorporation
        cacNumber: $cacNumber
        tin: $tin
        sector: $sector
        numberOfEmployees: $numberOfEmployees
        annualTurnover: $annualTurnover
        isProfessional: $isProfessional
        vatRegistered: $vatRegistered
        vatNumber: $vatNumber
        taxYear: $taxYear
        complianceStatus: $complianceStatus
        businessAddress: $businessAddress
        email: $email
        phoneNumber: $phoneNumber
        classification: $classification
        taxRate: $taxRate
      }
    ) {
      id
    }
  }
`;

export const UPDATE_BUSINESS_PROFILE = `
  mutation UpdateBusinessProfile(
    $id: ID!
    $businessName: String
    $businessType: String
    $yearOfIncorporation: Int
    $cacNumber: String
    $tin: String
    $sector: String
    $numberOfEmployees: Int
    $annualTurnover: Float
    $isProfessional: Boolean
    $vatRegistered: Boolean
    $vatNumber: String
    $taxYear: String
    $complianceStatus: String
    $businessAddress: String
    $email: String
    $phoneNumber: String
    $classification: String
    $taxRate: Int
  ) {
    updateBusinessProfile(
      where: { id: $id }
      data: {
        businessName: $businessName
        businessType: $businessType
        yearOfIncorporation: $yearOfIncorporation
        cacNumber: $cacNumber
        tin: $tin
        sector: $sector
        numberOfEmployees: $numberOfEmployees
        annualTurnover: $annualTurnover
        isProfessional: $isProfessional
        vatRegistered: $vatRegistered
        vatNumber: $vatNumber
        taxYear: $taxYear
        complianceStatus: $complianceStatus
        businessAddress: $businessAddress
        email: $email
        phoneNumber: $phoneNumber
        classification: $classification
        taxRate: $taxRate
      }
    ) {
      id
    }
  }
`;

export const PUBLISH_BUSINESS_PROFILE = `
  mutation PublishBusinessProfile($id: ID!) {
    publishBusinessProfile(where: { id: $id }, to: PUBLISHED) {
      id
    }
  }
`;

/* ------------------------------------------------------------------ */
/*  Transactions                                                      */
/* ------------------------------------------------------------------ */

export const GET_TRANSACTIONS = `
  query GetTransactions($userId: ID!) {
    transactions(where: { userr: { id: $userId } }, orderBy: date_DESC) {
      id
      businessName
      date
      description
      amount
      type
      category
      confidence
      status
      userr {
        id
      }
    }
  }
`;

export const CREATE_TRANSACTION = `
  mutation CreateTransaction(
    $userId: ID!
    $businessName: String!
    $date: Date!
    $description: String!
    $amount: Float!
    $type: String!
    $category: String
    $confidence: Float
    $status: String
  ) {
    createTransaction(
      data: {
        userr: { connect: { id: $userId } }
        businessName: $businessName
        date: $date
        description: $description
        amount: $amount
        type: $type
        category: $category
        confidence: $confidence
        status: $status
      }
    ) {
      id
    }
  }
`;

export const PUBLISH_TRANSACTION = `
  mutation PublishTransaction($id: ID!) {
    publishTransaction(where: { id: $id }, to: PUBLISHED) {
      id
    }
  }
`;

export const DELETE_TRANSACTION = `
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(where: { id: $id }) {
      id
    }
  }
`;

/* ------------------------------------------------------------------ */
/*  Tax Returns                                                       */
/* ------------------------------------------------------------------ */

export const GET_TAX_RETURNS = `
  query GetTaxReturns($userId: ID!) {
    taxReturns(where: { userr: { id: $userId } }, orderBy: createdAt_DESC) {
      id
      businessName
      year
      totalRevenue
      totalExpenses
      taxLiability
      statuss
      createdAt
      userr {
        id
      }
    }
  }
`;

export const CREATE_TAX_RETURN = `
  mutation CreateTaxReturn(
    $userId: ID!
    $businessName: String!
    $year: String!
    $totalRevenue: Float!
    $totalExpenses: Float!
    $taxLiability: Float!
    $statuss: String!
  ) {
    createTaxReturn(
      data: {
        userr: { connect: { id: $userId } }
        businessName: $businessName
        year: $year
        totalRevenue: $totalRevenue
        totalExpenses: $totalExpenses
        taxLiability: $taxLiability
        statuss: $statuss
      }
    ) {
      id
    }
  }
`;

export const PUBLISH_TAX_RETURN = `
  mutation PublishTaxReturn($id: ID!) {
    publishTaxReturn(where: { id: $id }, to: PUBLISHED) {
      id
    }
  }
`;

/* ------------------------------------------------------------------ */
/*  Scenarios                                                         */
/* ------------------------------------------------------------------ */

export const GET_SCENARIOS = `
  query GetScenarios($userId: ID!) {
    scenarios(where: { userr: { id: $userId } }, orderBy: createdAt_DESC) {
      id
      businessName
      name
      capex
      revenue
      isPioneer
      createdAt
      userr {
        id
      }
    }
  }
`;

export const CREATE_SCENARIO = `
  mutation CreateScenario(
    $userId: ID!
    $businessName: String!
    $name: String!
    $capex: Float!
    $revenue: Float!
    $isPioneer: Boolean!
  ) {
    createScenario(
      data: {
        userr: { connect: { id: $userId } }
        businessName: $businessName
        name: $name
        capex: $capex
        revenue: $revenue
        isPioneer: $isPioneer
      }
    ) {
      id
    }
  }
`;

export const PUBLISH_SCENARIO = `
  mutation PublishScenario($id: ID!) {
    publishScenario(where: { id: $id }, to: PUBLISHED) {
      id
    }
  }
`;

/* ------------------------------------------------------------------ */
/*  Documents                                                         */
/* ------------------------------------------------------------------ */

export const GET_DOCUMENTS = `
  query GetDocuments($userId: ID!) {
    documents(where: { userr: { id: $userId } }, orderBy: createdAt_DESC) {
      id
      businessName
      name
      fileUrl
      documentType
      taxYear
      createdAt
      userr {
        id
      }
    }
  }
`;

export const CREATE_DOCUMENT = `
  mutation CreateDocument(
    $userId: ID!
    $businessName: String!
    $name: String!
    $fileUrl: String!
    $documentType: String!
    $taxYear: String
  ) {
    createDocument(
      data: {
        userr: { connect: { id: $userId } }
        businessName: $businessName
        name: $name
        fileUrl: $fileUrl
        documentType: $documentType
        taxYear: $taxYear
      }
    ) {
      id
    }
  }
`;

export const PUBLISH_DOCUMENT = `
  mutation PublishDocument($id: ID!) {
    publishDocument(where: { id: $id }, to: PUBLISHED) {
      id
    }
  }
`;

/* ------------------------------------------------------------------ */
/*  Drafts                                                            */
/* ------------------------------------------------------------------ */

export const GET_DRAFT = `
  query GetDraft($userId: ID!, $key: String!) {
    drafts(where: { userr: { id: $userId }, key: $key }, first: 1) {
      id
      key
      data
      userr {
        id
      }
    }
  }
`;

export const CREATE_DRAFT = `
  mutation CreateDraft($userId: ID!, $key: String!, $data: Json!) {
    createDraft(
      data: {
        userr: { connect: { id: $userId } }
        key: $key
        data: $data
      }
    ) {
      id
    }
  }
`;

export const UPDATE_DRAFT = `
  mutation UpdateDraft($id: ID!, $data: Json!) {
    updateDraft(where: { id: $id }, data: { data: $data }) {
      id
    }
  }
`;
