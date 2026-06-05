import { Body, Controller, Get, Post, Request, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guards';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ){};

    @Post('login')
    login( @Body() loginDto: LoginDto, @Req() req) {
        return this.authService.login(loginDto, req);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Get('perfil')
    getPerfil(@Request() req){
        return req.user; 
    }
}
