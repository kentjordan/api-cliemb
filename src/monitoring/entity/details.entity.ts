export default interface IDetailsEntity {
    id: string;
    created_at: Date;
    updated_at: Date;
    room: string;
    floor_no: string;
    equipment_needed: string[];
    narrative: string;
    user_id: string;
}