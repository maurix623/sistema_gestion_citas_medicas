import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuarioService } from 'src/usuario/usuario.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { EventoAcceso } from 'src/logs_acceso/enums/evento-acceso.enum';
import { LogsAccesoService } from 'src/logs_acceso/logs_acceso.service';

@Injectable()
export class AuthService {
    constructor(
    private readonly usuarioServ: UsuarioService,
    private readonly jwtServ: JwtService,
    private readonly logsAccesoServ: LogsAccesoService
    ) {}

    async login(loginDto: LoginDto, req: any) {
    const usuario = await this.usuarioServ.findByCorreo(loginDto.correo);
    if (!usuario) {throw new UnauthorizedException('Credenciales incorrectas');}

    const passwordValido = await bcrypt.compare(loginDto.password,usuario.password);
    if (!passwordValido) {throw new UnauthorizedException('Credenciales incorrectas');}

    const payload = {sub: usuario.id_usuario,correo: usuario.correo,rol: usuario.rol.nombre_rol};

    const token = await this.jwtServ.signAsync(payload);

    const ip = req.ip;

    const browser = req.headers['user-agent'] ?? 'Desconocido';

    await this.logsAccesoServ.registrarEvento(usuario.id_usuario,ip,browser,EventoAcceso.INGRESO,);

    return {access_token: token};
    }

    async logout(usuario: any, req: any) {
        const ip = req.ip;
        const browser =req.headers['user-agent'] ?? 'Desconocido';

        await this.logsAccesoServ.registrarEvento(usuario.sub,ip,browser,EventoAcceso.SALIDA);
    
        return {message: 'Sesión cerrada correctamente'};
    }
}
