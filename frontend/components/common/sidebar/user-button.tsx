import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FirebaseUserContext } from "@/lib/firebase-user";
import React, { MouseEventHandler, useContext, useEffect, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { settingApikey, useGetApikey } from "@/hooks/use-apikey-fetch";

function UserButton() {
  const user = useContext(FirebaseUserContext);

  const signOut: MouseEventHandler = (event) => {
    event.preventDefault();
    user.signOut?.();
  };

  const [isKeyInputOpen, setIsKeyInputOpen] = useState(false);
  const [apikeyValue, setApikeyValue] = useState("");

  const addApikey = (apikeyValue: string) => {
    settingApikey(user?.currentUser?.uid ?? "", apikeyValue)
    setApikeyValue("")
    setIsKeyInputOpen(false)
  };

  const [originApikey, setOriginApikey] = useState("");

  useGetApikey(user?.currentUser?.uid ?? "").then((res) => setOriginApikey(res ?? ""))

  const maskApikey = (apikey: string) => {
    if (apikey.length <= 6) return "***************";
    const visibleStart = apikey.slice(0, 3);
    const visibleEnd = apikey.slice(-3);
    const maskedMiddle = "***************";
    return `${visibleStart}${maskedMiddle}${visibleEnd}`;
  };

  return user.currentUser?.uid ? (
    <div>
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
          <DropdownMenuLabel>
            {user.currentUser?.displayName || user?.currentUser?.uid}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsKeyInputOpen(true)}>API KEY</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut}>Sign Out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={isKeyInputOpen} onOpenChange={setIsKeyInputOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add API KEY</DialogTitle>
            <DialogDescription>
              
            </DialogDescription>
          </DialogHeader>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="text"
              placeholder="input API KEY"
              value={apikeyValue}
              onChange={(e) => setApikeyValue(e.target.value)}
            />
            <Button disabled={apikeyValue.trim() === ""} onClick={() => addApikey(apikeyValue)}>Add</Button>
          </div>
          <div className="mt-2">
            API KEY &#58; {maskApikey(originApikey)}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  ) : (
    <></>
  );
}

export default UserButton;
