import Link from "next/link";
// import { useQuery } from "urql";
import { useRouter } from "next/router";
import { Stack, Text } from "@chakra-ui/react";
import { NextSeo } from "next-seo";

///
import { withUrqlClient, initUrqlClient } from "next-urql";
import {
  ssrExchange,
  dedupExchange,
  cacheExchange,
  fetchExchange,
  useQuery,
} from "urql";

const SingleCharacterQuery = `
  query ($characterId: ID!) {
    character(id: $characterId) {
      id
      image
      name
      status
      species
      created
      gender
      origin {
        name
      }
      location {
        name
      }
      episode {
        id
        name
        air_date
      }
    }
  }
`;

const SingleCharacterQuery1 = `
  query {
    characters {
      results {
        name
      }
    }
  }
`;
function CharacterPage(props) {
  //const { result } = props;

  // next hooks
  const { query } = useRouter();

  // constants
  const { id } = query;
  console.log("\n ~ CharacterPage ~ id", id);

  // urql hooks
  const [result] = useQuery({
    query: SingleCharacterQuery,
    variables: { characterId: id },
  });

  const { data, fetching: isLoading, error } = result;

  console.log("\n ~ CharacterPage ~ error", error);
  console.log("\n ~ CharacterPage ~ isLoading", isLoading);
  console.log("\n ~ CharacterPage ~ data", data);

  if (isLoading || error) {
    return null;
  }

  return (
    <Stack>
      <NextSeo title={data.character.name} />
      <Text color="white" fontSize="2xl">
        {data.character.name}
      </Text>
      <Text color="white" fontSize="3xl">
        Episodios:
      </Text>

      {data.character.episode.map((e) => (
        <Stack key={e.id}>
          <Link href={`/episode/${e.id}`}>
            <Text color="white" fontSize="1xl">
              {e.name}
            </Text>
          </Link>
          <Text color="white" fontSize="1xl">
            Fecha de lazamiento: {e.air_date}
          </Text>
        </Stack>
      ))}
    </Stack>
  );
}

export async function getServerSideProps(context) {
  const { query } = context;
  const { id } = query;

  const ssrCache = ssrExchange({ isClient: false });
  const client = initUrqlClient(
    {
      url: "https://rickandmortyapi.com/graphql",
      exchanges: [dedupExchange, cacheExchange, ssrCache, fetchExchange],
    },
    true
  );

  // This query is used to populate the cache for the query
  // used on this page.
  try {
    await client.query(SingleCharacterQuery, { characterId: id }).toPromise();
  } catch (err) {
    console.log("err", err);
  }

  return {
    props: {
      // urqlState is a keyword here so withUrqlClient can pick it up.
      urqlState: ssrCache.extractData(),
    },
  };
}

export default withUrqlClient(
  (ssr) => ({
    url: "https://rickandmortyapi.com/graphql",
  }),
  { ssr: false } // Important so we don't wrap our component in getInitialProps
)(CharacterPage);
