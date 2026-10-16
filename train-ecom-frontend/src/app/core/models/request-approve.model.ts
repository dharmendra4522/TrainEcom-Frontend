export interface Element extends Record<string, unknown> {
    id: number,
    requestBy: string,
    requestDate: string,
    requestType: string[],
    requestMesage: string
}