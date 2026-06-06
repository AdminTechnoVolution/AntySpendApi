import {
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

const ENTITY_ID_PATTERN = /^[a-f0-9]{32}$/;

@Injectable()
export class ParseEntityIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (typeof value !== 'string' || !ENTITY_ID_PATTERN.test(value)) {
      throw new BadRequestException('Invalid entity id');
    }
    return value;
  }
}
