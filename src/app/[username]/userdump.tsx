"use client"

import DeleteButton from "./DeleteButton";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Dumps, User } from "@prisma/client";
import { Session } from "next-auth";
import { useEffect, useRef, useState } from "react";
import { deleteDump } from "../actions";

const UserDump = ({ dump, auth, user }: { dump: Dumps, auth: Session | null, user: User }) => {

    const [deleteConfirmation, setDeleteConfirmation] = useState(false);
    const lid = useRef<SVGSVGElement>(null);
    const ball = useRef<HTMLDivElement>(null);
    const _dump = useRef<HTMLDivElement>(null);
    
    function yesDeleteIt() {
        if (!ball.current || !lid.current) return;

        const bin = lid.current.parentElement!.children[1]!.getBoundingClientRect();

        const x = bin.left + bin.width/2 - ball.current.getBoundingClientRect().left - ball.current.getBoundingClientRect().width/2;
        const y = bin.top + bin.height/2 - ball.current.getBoundingClientRect().top - ball.current.getBoundingClientRect().height/2;


        ball.current.animate([
            {
                translate: `${x}px ${y}px`,
            },
        ], {
            duration: 200,
            easing: "ease-in-out",
            fill: "forwards",
        });

        setTimeout(() => {
            lid.current?.classList.remove("open");
        }, 200);

        setTimeout(() => {
            ball.current?.classList.add("gone");
        }, 300)

        setTimeout(() => {
            deleteDump(dump.id);
            setDeleteConfirmation(false);
            _dump.current!.style.display = "none";
        }, 700);

    }

    useEffect(() => {
        if (!_dump.current || !lid.current) return;
        
        const bin = lid.current.parentElement!.getBoundingClientRect();
        const dmp = _dump.current.getBoundingClientRect();

        const x = dmp.left + dmp.width/2 - bin.left - bin.width/2;
        const y = dmp.top + dmp.height*3/4 - bin.top - bin.height/2;

        lid.current.parentElement!.style.setProperty("--x", `${x}px`);
        lid.current.parentElement!.style.setProperty("--y", `${y}px`);

    }, [])

    return (
        <>
            <div ref={_dump} className={`dump mt-8 rounded-xl border p-5 pt-4 dark:border-gray-500 ${deleteConfirmation && "confirm-delete"}`}>
                <div className="flex items-center justify-between gap-2">
                    <div className={`flex flex-col ${deleteConfirmation ? "invisible" : ""}`}>
                        <div className="flex text-sm text-gray-500 dark:text-gray-400">
                            {new Date(dump.createdAt).toLocaleString("en-US", {
                                day: "numeric",
                                month: "long",
                            })}
                            {"  "}
                            {new Date(dump.createdAt).toLocaleString("en-US", {
                                hour: "numeric",
                                minute: "numeric",
                                hour12: true,
                            })}

                            {dump.isPrivate && auth?.user.id === user.id ? (
                                <>
                                    <span className="mx-2">•</span>
                                    <span className="inline-flex">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 16 16"
                                            fill="currentColor"
                                            className="h-4 w-4"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </span>
                                </>
                            ) : null}
                        </div>
                    </div>

                    {auth?.user.id === user.id && (
                        <DeleteButton ref={lid} confirm={deleteConfirmation} setConfirm={setDeleteConfirmation} id={dump.id} />
                    )}
                </div>
                <div className={`prose-slate text-md prose-h1:text-xl prose-h2:text-lg mt-4 ${deleteConfirmation ? "invisible" : ""}`}>
                    <Markdown remarkPlugins={[remarkGfm]}>
                        {dump.content}
                    </Markdown>
                </div>
                <button onClick={yesDeleteIt} onMouseEnter={() => lid.current?.classList.add("open")} onMouseLeave={() => lid.current?.classList.remove('open')} className={`${deleteConfirmation && "on"} confirm-btn-y absolute top-[75%] -translate-y-1/2 left-[30%]`}>yes</button>
                <button onClick={() => ( setDeleteConfirmation(false) )} className={`${deleteConfirmation && "on"} confirm-btn-n absolute top-[75%] -translate-y-1/2 right-[30%]`}>no</button>
                <div ref={ball} className="psuedo-dump" />
            </div>
            {
                deleteConfirmation && (
                    <p className="text-xs text-center mt-2 text-white/30">
                        Are you sure you want to delete this dump?
                    </p>
                )
            }
        </>
    )
}

export default UserDump;