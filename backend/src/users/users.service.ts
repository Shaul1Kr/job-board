import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(
    email: string,
    passwordHash: string,
    role: 'employer' | 'candidate',
  ): Promise<UserDocument> {
    const newUser = new this.userModel({ email, passwordHash, role });
    return await newUser.save();
  }

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return await this.userModel
      .findOne({ email: email.toLowerCase().trim() })
      .exec();
  }
}
