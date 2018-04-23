import { Request } from '../request';

export async function calculateAvailability(requests: Request[]): Promise<void> {
  for (let i = 0; i < requests.length; i++) {
    requests[i].availability = true;
    for (let j = 0; j < requests.length; j++) {
      if (i === j) {
        continue;
      }
      const locationI = requests[i].location;
      const locationJ = requests[j].location;

      if (locationI.id == locationJ.id &&
          ((requests[i].startTime >= requests[j].startTime && requests[i].startTime <= requests[j].endTime) ||
           (requests[i].endTime >= requests[j].startTime && requests[i].endTime <= requests[j].endTime) ||
           (requests[i].startTime <= requests[j].startTime && requests[i].endTime >= requests[j].startTime))) {
        requests[i].availability = false;
        requests[i].cause = `Bertabrakan dengan ${requests[j].name}`;
      }
    }
  }
}