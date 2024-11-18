// import {
//   collection,
//   getFirestore,
//   onSnapshot,
//   query,
// } from "firebase/firestore";
// import { useCallback, useEffect, useMemo, useState } from "react";

// export const useMegaData = (rootName: string) => {

//   const [data, setData] = useState<any[]>([]); // 데이터를 저장할 상태
//   const [loading, setLoading] = useState(true); // 로딩 상태
//   const [error, setError] = useState<Error | null>(null); // 에러 상태

//   const firestore = getFirestore();
  
//   // 컬렉션 참조 생성
//   const filesCollection = useMemo(() => collection(firestore, rootName), [firestore, rootName]);

//   useEffect(() => {
//     // Firestore에서 실시간 데이터 구독
//     const q = query(filesCollection);
//     const unsubscribe = onSnapshot(
//       q,
//       (snapshot) => {
//         const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         setData(docs); // 데이터 상태 업데이트
//         setLoading(false); // 로딩 완료
//       },
//       (err) => {
//         console.error("Firestore Error: ", err);
//         setError(err);
//         setLoading(false);
//       }
//     );

//     // 컴포넌트 언마운트 시 구독 해제
//     return () => unsubscribe();
//   }, [filesCollection]);

//   return { data, loading, error };

// }


// import {
//   collection,
//   doc,
//   getFirestore,
//   getDocs,
//   onSnapshot,
//   query,
// } from "firebase/firestore";
// import { useEffect, useMemo, useState } from "react";

// export const useMegaData = (rootName: string) => {
//   const [data, setData] = useState<any[]>([]); // 데이터를 저장할 상태
//   const [loading, setLoading] = useState(true); // 로딩 상태
//   const [error, setError] = useState<Error | null>(null); // 에러 상태

//   const firestore = getFirestore();

//   const filesCollection = useMemo(() => collection(firestore, rootName), [firestore, rootName]);

//   useEffect(() => {
//     const fetchCollectionData = async () => {
//       try {
//         setLoading(true);
//         const q = query(filesCollection);

//         // Root 컬렉션 데이터 가져오기
//         const snapshot = await getDocs(q);
//         const docs = snapshot.docs;

//         // 각 문서의 하위 컬렉션까지 가져오기
//         const fetchSubCollections = async (docRef: any) => {
//           const subcollections: any[] = [];

//           const subCollectionSnap = await getDocs(collection(docRef, "강좌"));
//           subCollectionSnap.forEach((subDoc) => {
//             subcollections.push({
//               id: subDoc.id,
//               ...subDoc.data(),
//             });
//           });

//           return subcollections;
//         };

//         // 모든 문서에 대해 하위 컬렉션 탐색
//         const results = await Promise.all(
//           docs.map(async (doc) => ({
//             id: doc.id,
//             ...doc.data(),
//             subcollections: await fetchSubCollections(doc),
//           }))
//         );

//         setData(results);
//       } catch (err: any) {
//         console.error("Error fetching Firestore data:", err);
//         setError(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCollectionData();
//   }, [filesCollection]);

//   return { data, loading, error };
// };


// import {
//   collection,
//   doc,
//   getDocs,
//   getFirestore,
// } from "firebase/firestore";

// export const fetchAllData = async (collectionName: string) => {
//   const firestore = getFirestore();

//   // Root 컬렉션 가져오기
//   const rootCollectionRef = collection(firestore, collectionName);
//   const rootSnapshot = await getDocs(rootCollectionRef);

//   // 모든 문서 데이터 저장
//   const results: any[] = [];

//   // 재귀적으로 하위 컬렉션을 탐색하는 함수
//   const fetchSubCollections = async (docRef: any, path: string = "") => {
//     const subcollections: any[] = [];
//     const subCollectionRefs = await docRef.listCollections(); // 모든 하위 컬렉션 탐색

//     for (const subCollectionRef of subCollectionRefs) {
//       const subCollectionSnap = await getDocs(subCollectionRef);

//       // 하위 컬렉션 문서 데이터 가져오기
//       const subDocs = subCollectionSnap.docs.map((subDoc) => ({
//         id: subDoc.id,
//         ...subDoc.data(),
//         path: `${path}/${subCollectionRef.id}/${subDoc.id}`, // 경로 저장
//       }));

//       // 하위 컬렉션 내 데이터 추가
//       subcollections.push({
//         collectionName: subCollectionRef.id,
//         documents: subDocs,
//       });

//       // 더 깊은 하위 컬렉션을 재귀적으로 탐색
//       for (const subDoc of subCollectionSnap.docs) {
//         const deeperSubCollections = await fetchSubCollections(subDoc.ref, `${path}/${subCollectionRef.id}/${subDoc.id}`);
//         subcollections.push(...deeperSubCollections);
//       }
//     }

//     return subcollections;
//   };

//   // Root 컬렉션의 모든 문서 탐색
//   for (const doc of rootSnapshot.docs) {
//     const docData = {
//       id: doc.id,
//       ...doc.data(),
//       subcollections: await fetchSubCollections(doc.ref, `${collectionName}/${doc.id}`),
//     };
//     results.push(docData);
//   }

//   return results;
// };

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
  const staticSubCollections = ["강좌", "교재", "새소식 Q&A", "캐스트", "클린수강평"];

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