export interface Question {
  id: string;
  number: string;
  text: string;
  marks: number;
  order: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Answer {
  id: string;
  page: number;
  text: string;
  questionReference: string | null;
  boundingBox: BoundingBox;
  confidence?: number;
}

export interface Mapping {
  questionId: string;
  answerId: string;
  confidence: number;
  reason?: string;
  status: "mapped" | "review" | "unmatched";
}
