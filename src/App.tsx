import React, { useState, useEffect } from "react";
import { genKeyPairFromSeed } from "skynet-js";
import SkynetSVG from "./assets/skynet.svg";
import { Cirrus, SkyDBStorage } from "@createdreamtech/cirrus";
import { getAllNotes } from "./queries";
import { SkyNote, SkyNoteTableName } from "./schema";

function App() {
  const [secret, setSecret] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [notes, setNotes] = useState<
    { id: number; note: string; __origin: string }[]
  >([]);
  const [foreignPubKey, setForeignPubKey] = useState("");
  const [db, setDB] = useState<Cirrus>();
  const [initializedDB, setInitializedDB] = useState(false);
  const [revision, setRevision] = useState(0);
  const [authenticated, setAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [displaySuccess, setDisplaySuccess] = useState(false);

  function allNotes() {
    if (!notes) return;
    return notes.map((n, i) => {
      return (
        <div key={`${i}-note`}>
          <div className="mt-8">
            <h4 className="text-gray-300">A note from: {n.__origin}</h4>
            <textarea
              rows={3}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 focus:z-10 sm:text-sm sm:leading-5"
              value={n.note}
              readOnly
              autoFocus={true}
              placeholder="You did not set a note yet"
            />
          </div>
        </div>
      );
    });
  }
  // Generate Application Key , this is normally static we only need
  // the public key so it should be generated randomly
  useEffect(() => {
    const loadNote = async () => {
      if (initializedDB && db)
        try {
          const entries = await getAllNotes(db);
          setNotes(entries);
          // a little tricky state here update list of all the notes
          // to date
          const localEntries = entries.filter(
            (e) => e.__origin === db.defaultOrigin
          );

          if (localEntries.length > 0) {
            setNote(entries[localEntries.length - 1].note ?? "");
            setRevision(entries[localEntries.length - 1].id);
          }
        } catch (error) {
          setErrorMessage(error.message);
          setNote("");
        }
    };
    async function initializeDatabase() {
      if (secret !== "" && !initializedDB && submitted) {
        const appKeyPair = genKeyPairFromSeed("exampleAppKeySeed");
        const storage = new SkyDBStorage(secret, appKeyPair.publicKey);
        const cirrusDB = new Cirrus(storage, storage.pubKey);
        await cirrusDB.init();
        const actions = await cirrusDB.storage.get();
        console.log(actions);
        console.log(foreignPubKey);
        if (foreignPubKey !== "")
          try {
            // Here we just simply add the foreign key to the set of places we look for data
            // and we integrate the actions
            console.log("_------------");
            await cirrusDB.add(appKeyPair.publicKey, foreignPubKey);
            const actions = await cirrusDB.storage.get();
            console.log(actions);
          } catch (e) {
            console.log(e);
          }
        setDB(cirrusDB);
        setInitializedDB(true);
      }
      if (secret && initializedDB && submitted && loading) {
        await loadNote();
        setAuthenticated(true);
        setLoading(false);
      }
    }
    initializeDatabase();
  }, [
    secret,
    initializedDB,
    db,
    foreignPubKey,
    submitted,
    loading,
    authenticated,
  ]);

  const handleReset = () => {
    setSecret("");
    setForeignPubKey("");
    setSubmitted(false);
    setNote("");
    setNotes([]);
    setRevision(0);
    setErrorMessage("");
    setLoading(false);
    setDisplaySuccess(false);
    setAuthenticated(false);
    setInitializedDB(false);
  };

  const handleSubmitted = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    setLoading(true);
  };

  const handleSetNote = async () => {
    setLoading(true);

    //    const { privateKey } = genKeyPairFromSeed(secret);
    if (db)
      try {
        const skyNoteTable = await db.getTable(SkyNoteTableName, SkyNote);
        await skyNoteTable.asserts({ id: revision + 1, note });
        // for the sake of example every not is saved every time
        // this can instead be done on a cadence
        await db.save();
        setRevision(revision + 1);
        setDisplaySuccess(true);
        setTimeout(() => setDisplaySuccess(false), 5000);
      } catch (error) {
        setErrorMessage(error.message);
      }

    setLoading(false);
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div>
          <img className="mx-auto h-24 w-auto" src={SkynetSVG} alt="Skynet" />
          <h2 className="mt-6 text-center text-4xl sm:text-5xl font-extrabold text-gray-300">
            Note To Self
          </h2>
          <p className="mt-2 text-center text-sm leading-5 text-gray-300">
            Use SkyDB to write yourself a note and securely save it to a
            decentralized network
          </p>
        </div>

        {authenticated ? (
          <div>
            <form className="mt-8" onSubmit={handleSubmitted}>
              <div className="rounded-md shadow-sm">
                <div>
                  <textarea
                    rows={3}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 focus:z-10 sm:text-sm sm:leading-5"
                    value={note}
                    autoFocus={true}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="You did not set a note yet"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-green-600 hover:bg-green-500 focus:outline-none focus:border-green-700 focus:shadow-outline-green active:bg-green-700 transition duration-150 ease-in-out"
                  onClick={handleSetNote}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Save this note"}
                </button>
              </div>

              <div className="mt-2 flex justify-between">
                <button
                  onClick={handleReset}
                  className="background-transparent text-sm text-green-500 hover:underline outline-none focus:outline-none mr-1 mb-1"
                  type="button"
                >
                  &larr; go back
                </button>

                {displaySuccess && (
                  <span className="text-sm text-green-500 font-bold">
                    Your note has been saved!
                  </span>
                )}
              </div>

              {errorMessage && (
                <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
              )}
            </form>
            <div>
              <h3 className="text-gray-300">
                {" "}
                All notes with originating public keys:
              </h3>
            </div>
            <hr></hr>
            <div>{allNotes()}</div>
          </div>
        ) : (
          <form className="mt-8" onSubmit={handleSubmitted}>
            <input type="hidden" name="remember" value="true" />
            <div className="rounded-md shadow-sm">
              <div>
                <input
                  aria-label="Email address"
                  name="secret"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 focus:z-10 sm:text-sm sm:leading-5"
                  placeholder="Your very secret passphrase"
                  value={secret}
                  onChange={(event) => setSecret(event.target.value)}
                />
              </div>
              <div className="mt-8">
                <input
                  aria-label="Pubkey"
                  name="otherPubKey"
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 focus:z-10 sm:text-sm sm:leading-5"
                  placeholder="(Optional) another application public key"
                  value={foreignPubKey}
                  onChange={(event) => setForeignPubKey(event.target.value)}
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-green-600 hover:bg-green-500 focus:outline-none focus:border-green-700 focus:shadow-outline-green active:bg-green-700 transition duration-150 ease-in-out"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg
                    className="h-5 w-5 text-green-500 group-hover:text-green-400 transition ease-in-out duration-150"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                Submit
              </button>
            </div>
          </form>
        )}

        <footer className="mt-6 text-center text-sm leading-5 text-gray-300">
          Read more on{" "}
          <a
            className="text-green-500 hover:underline"
            href="https://github.com/kwypchlo/skydb-example"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          {process.env.REACT_APP_GIT_SHA && (
            <a
              href={`https://github.com/kwypchlo/skydb-example/commit/${process.env.REACT_APP_GIT_SHA}`}
              className="mt-2 block text-xs text-gray-700 hover:underline font-mono"
            >
              {process.env.REACT_APP_GIT_SHA}
            </a>
          )}
        </footer>
      </div>
    </div>
  );
}

export default App;
