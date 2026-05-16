



"use server"

import { ZodFullFormDataSchema, ZodFullFormDataType } from "../zod-schemas/order-schema";




export async function createOrderAction(formData: ZodFullFormDataType) {

const validatedFields = ZodFullFormDataSchema.safeParse(formData);


console.log(formData)

if (!validatedFields.success){
    
    return {data: null, error: validatedFields.error.issues}
}



return {data: "success", error: null}


} 