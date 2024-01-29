import {
  Controller,
  Get,
  Inject,
  Param,
  ParseFilePipeBuilder,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DocsService } from './docs.service';
import { CurrentUser } from '@/user/currentuser.decorator';
import { UserWithRoleDto } from '@/user/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path from 'path';
import { createReadStream } from 'fs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PaginationParamsDto } from '@/shared/shared.dto';
import { FileUploadDto, PaginatedDocsResponseDto } from './docs.dto';
import { ZodSerializerDto } from 'nestjs-zod';
import { DocDto } from '@/prisma/generated/zod';
import { JwtGuard } from '@/guards/jwt.guard';

@Controller('docs')
@ApiTags('docs')
export class DocsController {
  constructor(
    private readonly docsService: DocsService,
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
  ) {}

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  async streamFile(
    @Param('id') id: string,
    @CurrentUser() user: UserWithRoleDto,
  ) {
    const fileMetadata: DocDto = await this.docsService.getDocById({
      userId: user.role.name === 'USER' ? user.id : undefined,
      id: id,
    });
    const stream = createReadStream(fileMetadata.src);

    return new StreamableFile(stream, {
      disposition: `inline; filename="${fileMetadata.name}"`,
      type: fileMetadata.mimetype,
    });
  }

  @Post()
  @ZodSerializerDto(DocDto)
  @UseGuards(JwtGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: path.join(process.cwd(), './public/uploads'),
        filename: (_, file, cb) => {
          cb(
            null,

            `${new Date()
              .toISOString()
              .replace(/:/g, '-')}-${file.originalname.replace(/\s+/g, '')}`,
          );
        },
      }),
    }),
  )
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: DocDto })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto })
  async uploadDoc(
    @CurrentUser() user: UserWithRoleDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: 'png|jpeg|pdf' })
        .addMaxSizeValidator({ maxSize: Math.pow(1024, 2) }) // 1MB
        .build(),
    )
    file: Express.Multer.File,
  ) {
    const doc = await this.docsService.addDoc({
      userId: user.id,
      file,
    });
    return doc;
  }

  @Get()
  @ZodSerializerDto(PaginatedDocsResponseDto)
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: PaginatedDocsResponseDto })
  async getDocs(@Query() query: PaginationParamsDto) {
    const cachedDocs =
      await this.cacheService.get<PaginatedDocsResponseDto | null>('getDocs');
    if (cachedDocs) {
      console.log('from cache');
      return cachedDocs;
    }
    const docs = await this.docsService.getDocs(query);
    await this.cacheService.set('getDocs', docs);
    return docs;
  }
}
