import { Role } from "../../core/models/auth.model";

export interface MenuItem {
  label: string;
  icon: string;
  route: string;
  role?: Role;
}
