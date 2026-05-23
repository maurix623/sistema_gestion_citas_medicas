import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuarioService } from 'src/usuario/usuario.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usuarioServ: UsuarioService,
        private readonly jwtServ: JwtService,
    ){};

    async login(loginDto: LoginDto){
        const usuario = await this.usuarioServ.findByCorreo(loginDto.correo);
        if(!usuario) throw new UnauthorizedException ('Credenciales incorrectas');

        const passwordValido = await bcrypt.compare(loginDto.password, usuario.password);
        if(!passwordValido) throw new UnauthorizedException('Credenciales incorrectas');

        const payload = {sub: usuario.id_usuario, correo: usuario.correo, rol: usuario.rol.nombre_rol};

        const token = await this.jwtServ.signAsync(payload);

        return {access_token: token};
    }
}
