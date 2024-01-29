import { DocSchema } from '@/prisma/generated/zod';
import { createPaginatedResponseSchema } from '@/shared/shared.dto';
import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';

export class PaginatedDocsResponseDto extends createZodDto(
  createPaginatedResponseSchema(DocSchema),
) {}

export class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file!: Express.Multer.File;
}
