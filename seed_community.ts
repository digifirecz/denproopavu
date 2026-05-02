
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, deleteDoc, doc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

async function seedData() {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (!fs.existsSync(configPath)) {
    console.error('Missing firebase-applet-config.json');
    return;
  }

  const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

  console.log('Seeding community sections...');

  try {
    // 1. Organizace
    await addDoc(collection(db, 'communitySections'), {
      title: 'Organizace',
      name: 'Prezentace organizací',
      description: 'Poznejte místní neziskovky a projekty, které pomáhají lidem v Brně a okolí.',
      tag: '',
      items: [
        { name: 'Teen Challenge', description: 'Prevence a pomoc lidem se závislostmi.' },
        { name: 'Brněnská Diakonie', description: 'Sociální služby pro seniory a rodiny.' },
        { name: 'Naděje Brno', description: 'Pomoc lidem v nouzi a bez domova.' }
      ],
      order: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // 2. Zóna klidu
    await addDoc(collection(db, 'communitySections'), {
      title: 'Zóna klidu',
      name: 'Klidnější zóna pro rozhovor',
      description: 'Místo pro ztišení, modlitební stan nebo osobní sdílení v naší naslouchárně. Jsme tu pro vás, když si potřebujete promluvit v klidnějším prostředí mimo hlavní ruch festivalu.',
      tag: 'Tým pro naslouchání připraven',
      items: [],
      order: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('Seed successful!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

seedData();
