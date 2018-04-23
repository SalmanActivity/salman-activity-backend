import Report from './report';
import { Accessor } from '../accessor';

export default interface ReportAccessor extends Accessor<Report> {

	getAllBetween(start:Date, end:Date): Promise<Report[]>;

	getByRequestId(requestId:string): Promise<Report>;

}