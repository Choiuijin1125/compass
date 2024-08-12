import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FirebaseUserContext } from "@/lib/firebase-user";
import React, { MouseEventHandler, useContext, useState } from "react";
import Image from "next/image";

function UserButton() {
  const user = useContext(FirebaseUserContext);

  const logoutClick: MouseEventHandler = (event) => {
    event.preventDefault();
    user.signOut?.();
  };

  
  return (
    user.currentUser?.uid ? (
      <DropdownMenu>
        <DropdownMenuTrigger>
        {user.currentUser?.photoURL && (
          <Image
            className="ml-2 h-8 w-8 rounded-full"
            src={user.currentUser.photoURL}
            alt="User Avatar"
            width={30}
            height={30}
          />
        )}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{user.currentUser?.displayName || user?.currentUser?.uid}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logoutClick}>
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) : (<></>)
  );
}

export default UserButton;
