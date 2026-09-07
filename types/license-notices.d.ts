declare module "virtual:license-notices" {
  export interface LicenseNotice {
    name: string;
    version: string;
    license?: string;
    text?: string;
  }

  const notices: LicenseNotice[];
  export default notices;
}
