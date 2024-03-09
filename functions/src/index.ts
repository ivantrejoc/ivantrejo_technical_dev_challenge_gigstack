/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";
import {createInvoices}
  from "./controllers/invoiceControllers";


export const invoiceData = onRequest(async (request, response) => {
  try {
    const invoices = await createInvoices();
    console.log("LOS LOTES DE FACTS SEPARADAS POR ID COMMERCE: ", invoices);
    response.status(200).json(invoices);
  } catch (error) {
    response.status(500).send(error);
  }
});
