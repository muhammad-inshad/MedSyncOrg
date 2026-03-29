import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../../../utils/apiResponse.utils.ts";
import { MESSAGES } from "../../../../constants/messages.ts";
import { IDashbord } from "../../../../services/hospital/hospital/interfaces/dashbord.services.interfaces.ts";

export class Dashbord {
   constructor(private readonly _dashbord:IDashbord){}

   async getstatus(req: Request, res: Response, next: NextFunction): Promise<void>{
     try {
        const stats = await this._dashbord.getDashboardStats();
        ApiResponse.success(res,"succss",stats)
     } catch (error) {
        next(error)
     }
   }
}