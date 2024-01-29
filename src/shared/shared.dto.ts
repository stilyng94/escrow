import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export class PaginationParamsDto extends createZodDto(
  z.object({
    limit: z.coerce.number().int().positive().min(1).default(1),
    offset: z.coerce.number().int().min(0).default(0),
    cursor: z.coerce.string().optional(),
  }),
) {}

export function createPaginatedResponseSchema<ItemType extends z.ZodTypeAny>(
  itemSchema: ItemType,
) {
  return z.object({
    count: z.number().int().default(0),
    items: z.array(itemSchema),
    cursor: z.string().optional(),
  });
}

export class PaginationParamsOpenApi {
  @ApiProperty({ type: PaginationParamsDto })
  query!: PaginationParamsDto;
}
