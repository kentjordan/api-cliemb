import { Injectable } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { Request } from 'express';
import CreateLevelEmergencyDto from 'src/monitoring/dto/levelEmergency.dto';

@Injectable()
export class OfflineEmergencyService {

    async createOfflineEmergency(req: Request, body: CreateLevelEmergencyDto) {

        const access_token = req.headers.authorization.split(" ").at(1);

        const res = await axios.post(`${process.env.NODE_ENV === 'production' ? process.env.PROD_API_HOSTNAME : process.env.DEV_API_HOSTNAME}/api/monitoring`, body, {
            headers: {
                Authorization: `Bearer ${access_token}`
            },
            timeout: 5000
        });

        console.log(res.status);

    }
}
