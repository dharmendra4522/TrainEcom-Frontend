import { Role } from "../../core/models/app.model";

export interface MenuItem {
  label: string;
  icon: string;
  route: string;
  role?: Role;
}
