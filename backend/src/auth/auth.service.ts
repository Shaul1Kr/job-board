import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const { email, password, role } = dto;
    const existingUser = await this.usersService.findUserByEmail(email);
    if (existingUser) {
      this.logger.warn(`Register failed — email already in use: ${email}`);
      throw new ConflictException('User already exists');
    }
    const passwordHash = await this.hashPassword(password);
    const user = await this.usersService.createUser(email, passwordHash, role);
    this.logger.log(`User registered: ${email} (${role})`);
    return {
      accessToken: this.jwtService.sign({
        sub: user._id.toString(),
        email,
        role,
      }),
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const passwordHash = await bcrypt.hash(password, 12);
    return passwordHash;
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      this.logger.warn(`Login failed — email not found: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      this.logger.warn(`Login failed — wrong password for: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }
    this.logger.log(`User logged in: ${email}`);
    return {
      accessToken: this.jwtService.sign({
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
      }),
    };
  }
}
