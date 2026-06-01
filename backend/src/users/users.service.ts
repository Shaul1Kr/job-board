import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(
    email: string,
    passwordHash: string,
    role: 'employer' | 'candidate',
  ): Promise<UserDocument> {
    const newUser = new this.userModel({ email, passwordHash, role });
    const saved = await newUser.save();
    this.logger.log(`Created user: ${email} (${role})`);
    return saved;
  }

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return await this.userModel
      .findOne({ email: email.toLowerCase().trim() })
      .exec();
  }
}
