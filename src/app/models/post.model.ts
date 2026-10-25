export interface Post {
  id: number;
  placeId: string;
  conteudo: string;
  imagemUrl?: string;
  createdAt: Date;
  expiresAt: Date;
}
