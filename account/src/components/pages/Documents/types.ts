export interface Document {
  documentType: string
  isUpload: boolean
  documentName: string
  documentPath: string
  documentSize: string
  documentStatus: 'accepted' | 'notAccepted' | 'checked'
}

export interface CoBorrower {
  [name: string]: Document[]
}

export interface serviceDocuments {
  status: string
  userName: string
  user: Document[]
  coBorrowers: CoBorrower
}
