import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class AssignNfcTagDto {
  @ApiProperty({
    description: 'Unique NFC tag UID (physical identifier on the card)',
    example: '04:A3:B2:C1:D0:E9:F8',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9A-Fa-f:]+$/, {
    message: 'uid must be a valid NFC UID (hex characters and colons only)',
  })
  uid: string;
}
