import { Button } from './ui/button';

export interface GoogleMapLinkProps {
  address: string;
}

export const GoogleMapLink = ({ address }: GoogleMapLinkProps) => (
  <Button variant="link" asChild>
    <a
      href={`https://www.google.com/maps?q=${encodeURIComponent(address)}`}
      target="_blank"
      rel="noreferrer"
    >
      View Location on Google Maps
    </a>
  </Button>
);
