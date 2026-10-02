import { db } from '../server/database.ts';

const cnt = db.prepare('SELECT COUNT(*) as c FROM public_projects').get() as { c: number };
console.log('public_projects 테이블 건수:', cnt.c);

const prjCnt = db.prepare('SELECT COUNT(*) as c FROM projects').get() as { c: number };
console.log('projects 테이블 건수:', prjCnt.c);

const prjPub = db.prepare("SELECT COUNT(*) as c FROM projects WHERE public_status = '게시'").get() as { c: number };
console.log('projects 중 게시 상태 건수:', prjPub.c);
