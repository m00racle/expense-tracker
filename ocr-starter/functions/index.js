import functions, { logger } from 'firebase-functions';
import vision from '@google-cloud/vision';
import admin from 'firebase-admin';

// initialize admin: ONLY USE THIS ON TRUSTED ENV LIKE FUNCTIONS NOT IN NEXT
admin.initializeApp();

// read that the object (in this case image on finalization of upload):

export const readReceiptDetails = functions.storage.object().onFinalize(async (object) => {
    const imageBucket = `gs://${object.bucket}/${object.name}`;
    const client = new vision.ImageAnnotatorClient();

    const [textDetection] = await client.textDetection(imageBucket);
    const [annotation] = textDetection.textAnnotations;
    const text = annotation ? annotation.description : '';
    logger.log(text);

    // logger to test if there's text annotated form the image.
    // for now let's just hardcode the result as it is to demo

    // get uid
    // object.name is userId/timestamp
    const re = /(.*)\//;
    const uid = re.exec(object.name)[1];

    // code above is because we want ot extract userId form userId/timestamp

    const receipt = {
        address: '123 Happy St, World 1',
        amount: '23.45',
        date: new Date(),
        imageBucket,
        items: 'best bla, lorem ipsum, dolr',
        locationName: 'Best Restaurant',
        uid,
        isConfirmed: false
    };

    // use the admin to add the receipt to firestore
    admin.firestore().collection('receipts').add(receipt);
});
