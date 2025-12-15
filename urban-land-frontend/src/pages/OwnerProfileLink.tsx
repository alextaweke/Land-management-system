// components/OwnerProfileLink.tsx (updated)
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

interface OwnerProfileLinkProps {
  ownerId?: number;
  username?: string;
  children: React.ReactNode;
}

const OwnerProfileLink: React.FC<OwnerProfileLinkProps> = ({
  ownerId,
  username,
  children,
}) => {
  const { user } = useAuth();

  if (user?.role === "owner") {
    // Owner always goes to their own profile
    return <Link to="/my-profile">{children}</Link>;
  }

  if (ownerId) {
    // Admin/Officer with specific owner ID
    return <Link to={`/owners/${ownerId}`}>{children}</Link>;
  }

  if (username) {
    // Admin/Officer searching by username
    return <Link to={`/owners?search=${username}`}>{children}</Link>;
  }

  // Default: Admin/Officer search page
  return <Link to="/owners">{children}</Link>;
};

export default OwnerProfileLink;
