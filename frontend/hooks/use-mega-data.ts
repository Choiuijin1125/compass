import {
  collection,
  doc,
  getDocs,
  getFirestore,
} from "firebase/firestore";

export const useMegaData = async (collectionName: string) => {
  const firestore = getFirestore();

  // Root 컬렉션 가져오기
  const rootCollectionRef = collection(firestore, collectionName);
  const rootSnapshot = await getDocs(rootCollectionRef);

  // 모든 문서 데이터 저장
  const results: any[] = [];

  // 고정된 하위 컬렉션 이름 배열
  const staticSubCollections = ["강좌", "교재", "새소식 Q&A", "캐스트", "클린수강평", "커리큘럼"];

  // 하위 컬렉션 데이터를 가져오는 함수
  const fetchStaticSubCollections = async (docRef: any, path: string = "") => {
    const subcollections: Record<string, any[]> = {}; // 하위 컬렉션 데이터를 객체로 저장

    for (const subCollectionName of staticSubCollections) {
      const subCollectionRef = collection(docRef, subCollectionName); // 고정된 하위 컬렉션 참조
      const subCollectionSnap = await getDocs(subCollectionRef);

      // 하위 컬렉션 문서 데이터 가져오기
      const subDocs = subCollectionSnap.docs.map((subDoc) => ({
        id: subDoc.id,
        ...subDoc.data(),
        path: `${path}/${subCollectionName}/${subDoc.id}`, // 경로 저장
      }));

      // 하위 컬렉션 데이터 저장
      subcollections[subCollectionName] = subDocs;
    }

    return subcollections;
  };

  // Root 컬렉션의 모든 문서 탐색
  for (const doc of rootSnapshot.docs) {
    const docData = {
      id: doc.id,
      ...doc.data(),
      subcollections: await fetchStaticSubCollections(doc.ref, `${collectionName}/${doc.id}`),
    };
    results.push(docData);
  }

  return results;
};