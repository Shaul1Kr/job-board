import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 's@g.com',
  })
  @IsEmail()
  email: string;
  @ApiProperty({
    description: 'The password of the user',
    example: 'password123',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'role of the user',
    example: 'employer',
  })
  @IsEnum(['employer', 'candidate'])
  role: 'employer' | 'candidate';
}
