import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase.config";

// Base64 인코딩
function base64Encode(data: string) {
  return Buffer.from(data).toString('base64');
}

// Base64 디코딩
function base64Decode(encodedData: string) {
  return Buffer.from(encodedData, 'base64').toString();
}

export const settingApikey = async (
  userId: string,
  apikey: string
) => {
  const userDocRef = doc(db, "users", userId);
  const encodedApikey = base64Encode(apikey);
  try {
    await setDoc(userDocRef, {
      apikey: encodedApikey,
    });
  } catch (err) {
    console.log("apikey setting error", err);
  }
}

export const useGetApikey = async (userId: string) => {
  const userDocRef = doc(db, "users", userId);
  try {
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const encodedApikey = docSnap.data().apikey;
      const decodedApikey = base64Decode(encodedApikey);
      return decodedApikey;
    } else {
      console.log("No such document!");
    }
  } catch (err) {
    console.log("apikey fetch error", err);
  }
};