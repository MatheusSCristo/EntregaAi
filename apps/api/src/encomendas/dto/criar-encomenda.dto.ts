import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CriarEncomendaDto {
  @IsUUID()
  unidadeId?: string;
  @IsUUID()
  moradorId?: string;
  @IsString()
  localArmazenamento?: string;
  @IsOptional()
  @IsString()
  observacao?: string;
  @IsOptional()
  @IsString()
  remetente?: string;
}
