import { PaginationParamsDto } from '@/shared/shared.dto';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { PaginatedDocsResponseDto } from './docs.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { DocDto } from '@/prisma/generated/zod';

@Injectable()
export class DocsService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
  ) {}

  async addDoc(arg: { userId: string; file: Express.Multer.File }) {
    const doc = await this.prismaService.doc.create({
      data: {
        name: arg.file.filename,
        mimetype: arg.file.mimetype,
        src: arg.file.path,
        transactionId: arg.userId,
      },
    });
    if (!doc) {
      throw new BadRequestException();
    }

    return doc;
  }

  async getDocById({
    id,
    userId,
  }:
    | {
        id: string;
        userId?: string;
      }
    | {
        id: string;
        userId: string;
      }): Promise<DocDto> {
    const file = await this.prismaService.doc.findUnique({
      where: { id, transactionId: userId },
    });
    if (!file) {
      throw new NotFoundException();
    }
    return file;
  }

  async getDocs(dto: PaginationParamsDto): Promise<PaginatedDocsResponseDto> {
    const [count, items] = await this.prismaService.$transaction([
      this.prismaService.doc.count(),
      this.prismaService.doc.findMany({
        take: dto.limit,
        skip: dto.offset,
        cursor: dto.cursor ? { id: dto.cursor } : undefined,
      }),
    ]);

    await this.cacheService.set('getDocs', {
      count,
      items: items satisfies Array<DocDto>,
      cursor: items.at(-1)?.id ?? dto.cursor ?? '',
    });

    return {
      count,
      items: items satisfies Array<DocDto>,
      cursor: items.at(-1)?.id ?? dto.cursor ?? '',
    };
  }
}
