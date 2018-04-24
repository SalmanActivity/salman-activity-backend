import { Request } from '../request';

/**
 * Fungsi calculateAvailability digunakan untuk menambahkan attribute availability pada request. Availability menentukan
 * apakan request yang diajukan valid atau tidak. Request yang tidak valid adalah request yang menggunakan ruangan pada
 * suatu waktu tertentu dan bertabrakan dengan request lain. Jika request tidak available, maka attribute availability-nya
 * akan di-set false dan attribute cause-nya akan berisi alasan mengapa request tersebut tidak available.
 * @param requests array berisi request yang ingin dicek availability-nya.
 */
export async function calculateAvailability(requests: Request[]): Promise<void> {
  for (let i = 0; i < requests.length; i++) {
    requests[i].availability = true;
    for (let j = 0; j < requests.length; j++) {
      if (i === j) {
        continue;
      }
      const locationI = requests[i].location;
      const locationJ = requests[j].location;

      if (locationI.id === locationJ.id &&
          ((requests[i].startTime >= requests[j].startTime && requests[i].startTime <= requests[j].endTime) ||
           (requests[i].endTime >= requests[j].startTime && requests[i].endTime <= requests[j].endTime) ||
           (requests[i].startTime <= requests[j].startTime && requests[i].endTime >= requests[j].startTime))) {
        requests[i].availability = false;
        requests[i].cause = `Bertabrakan dengan ${requests[j].name}`;
      }
    }
  }
}