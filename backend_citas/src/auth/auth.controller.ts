import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
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
    login(@Body() loginDto: LoginDto,){
        return this.authService.login(loginDto,);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Get('perfil')
    getPerfil(@Request() req){
        return req.user; 
    }
}
