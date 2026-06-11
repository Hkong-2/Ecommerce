import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current account password' })
  @IsString()
  @MinLength(1)
  currentPassword: string;

  @ApiProperty({
    description:
      'New password with at least 8 characters, including uppercase, lowercase, and a number',
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'New password must include uppercase, lowercase, and numeric characters',
  })
  newPassword: string;
}
