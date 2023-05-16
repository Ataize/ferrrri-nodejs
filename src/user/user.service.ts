import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async get(id: number, hash = false) {
    id = Number(id);
    // SE O ID Ñ É UM NÚMERO MOSTRA MSG ERRO
    if (isNaN(Number(id))) {
      throw new BadRequestException('ID is required');
    }
    // VAI NO DB USER ONDE TEM O ID E INCLUI TB OS DADOS DA PESSOA
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        person: true,
      },
    });
    if (!hash) {
      // p ele não mostrar a senha do cliente caso não seja autenticação
      delete user.password;
    }
    // SE O ID Ñ EXISTE RETORNA ERRO
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  // verificar se e-mail já existe
  async getByEmail(email: string) {
    if (!email) {
      throw new BadRequestException('E-mail is required');
    }
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        person: true,
      },
    });
    // p ele não mostrar a senha do cliente
    delete user.password;
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  // criar regsitro user
  async create({
    name,
    email,
    password,
    birthAt,
    phone,
    document,
  }: {
    name: string;
    email: string;
    password: string;
    birthAt?: Date;
    phone?: string;
    document?: string;
  }) {
    // verifica se os campos obrigatórios foram preenchidos
    if (!name) {
      throw new BadRequestException('Name is required.');
    }
    if (!email) {
      throw new BadRequestException('Email is required.');
    }
    if (!password) {
      throw new BadRequestException('Password is required.');
    }
    // verificar se a data é válida
    if (birthAt && birthAt.toString().toLowerCase() === 'invalid date') {
      throw new BadRequestException('Birth date is invalid');
    }
    let user = null;
    try {
      user = await this.getByEmail(email);
    } catch (e) {}
    if (user) {
      throw new BadRequestException('Email alread exists');
    }
    // passar as info p db
    const userCreated = await this.prisma.user.create({
      data: {
        person: {
          create: {
            name,
            birthAt,
            document,
            phone,
          },
        },
        email,
        // assim vou salvar o hash da senha
        password: bcrypt.hashSync(password, 10),
      },
      include: {
        person: true,
      },
    });
    // p ele não mostrar a senha do cliente
    delete userCreated.password;

    return userCreated;
  }
  // p fazer o update eu preciso do id
  async update(
    id: number,
    {
      name,
      email,
      birthAt,
      phone,
      document,
    }: {
      name?: string;
      email?: string;
      birthAt?: Date;
      phone?: string;
      document?: string;
    },
  ) {
    id = Number(id);
    if (isNaN(id)) {
      throw new BadRequestException('ID is not a number');
    }
    // recuperar os dados que querem ser alterados:
    const dataPerson = {} as Prisma.PersonUpdateInput;
    const dataUser = {} as Prisma.UserUpdateInput;

    if (name) {
      dataPerson.name = name;
    }
    if (birthAt) {
      dataPerson.birthAt = birthAt;
    }
    if (phone) {
      dataPerson.phone = phone;
    }
    if (document) {
      dataPerson.document = document;
    }
    if (email) {
      dataUser.email = email;
    }
    // obter o id do usuario
    const user = await this.get(id);

    //  eu sou vou excutar dataPerson se ele ñ estiver vazio
    if (dataPerson) {
      await this.prisma.person.update({
        where: {
          id: user.personId,
        },
        data: dataPerson,
      });
    }
    if (dataUser) {
      await this.prisma.user.update({
        where: {
          id,
        },
        data: dataUser,
      });
    }
    return this.get(id);
  }
  // método p verificar a senha:
  async checkPassword(id: number, password: string) {
    // eu passo true pq eu quero a senha venha
    const user = await this.get(id, true);

    const checked = await bcrypt.compare(password, user.password);

    if (!checked) {
      throw new UnauthorizedException('Email or password incorrect!');
    }

    return true;
  }
}
