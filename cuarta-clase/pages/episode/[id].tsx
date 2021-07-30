import Link from "next/link";
import { useQuery } from "urql";
import { useRouter } from "next/router";
import { Stack, Text } from "@chakra-ui/react";
import { NextSeo } from "next-seo";

const SingleEpisodeQuery = `
    query($episodeId: ID!){
        episode(id: $episodeId){
            id
            name
            air_date
            characters {
                id
                name
            }
        }
    }
`;

function episodePage() {
  const { query } = useRouter();

  const { id } = query;

  const [result] = useQuery({
    query: SingleEpisodeQuery,
    variables: { episodeId: id },
  });

  console.log("id", id);

  const { data, fetching: isLoading, error } = result;

  if (isLoading || error) {
    return null;
  }

  console.log("data", data);

  return (
    <Stack>
      <NextSeo title={data.episode.name} />
      <Text color="white" fontSize="2xl">
        {data.episode.name}
      </Text>
      <Text color="white" fontSize="1xl">
        Fecha de lanzamient: {data.episode.air_date}
      </Text>
      <Text color="white" fontSize="2xl">
        Personajes
      </Text>
      {data.episode.characters.map((character) => (
        <Stack key={character.id}>
          <Link href={`/character/${character.id}`}>
            <Text color="white" size="2xl">
              {character.name}
            </Text>
          </Link>
        </Stack>
      ))}
    </Stack>
  );
}

export default episodePage;
