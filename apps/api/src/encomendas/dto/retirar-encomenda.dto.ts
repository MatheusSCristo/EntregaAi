import { MetodoRetirada } from '@prisma/client';
import { IsEnum, IsString, Matches, ValidateIf } from 'class-validator';

export class RetirarEncomendaDto {
  @IsEnum(MetodoRetirada)
  metodo!: MetodoRetirada;

  @ValidateIf((dto: RetirarEncomendaDto) =>
    dto.metodo === MetodoRetirada.telefone || dto.codigo !== undefined,
  )
  @Matches(/^[0-9]{4}$/)
  codigo?: string;

  @ValidateIf((dto: RetirarEncomendaDto) =>
    dto.metodo === MetodoRetirada.manual || dto.justificativa !== undefined,
  )
  @IsString()
  justificativa?: string;
}
