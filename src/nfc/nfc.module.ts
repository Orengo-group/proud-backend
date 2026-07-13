import { Module } from '@nestjs/common';
import { NfcController } from './nfc.controller';
import { NfcService } from './nfc.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [NfcController],
  providers: [NfcService],
  exports: [NfcService],
})
export class NfcModule {}
