import { Action, ActionPanel, Icon, List } from "@raycast/api";
import * as yaml from "js-yaml";
import fetch from "node-fetch";
import { useEffect, useState } from "react";

interface Timeline {
  abstract_deadline: string;
  deadline: string;
}

interface Conference {
  year: number;
  id: string;
  link: string;
  timeline: Timeline[];
  timezone: string;
  date: string;
  place: string;
}

interface Item {
  title: string;
  description: string;
  sub: string;
  rank: {
    ccf: string;
    core: string;
    thcpl: string;
  };
  dblp: string;
  confs: Conference[];
}

interface GitHubContent {
  name: string;
  path: string;
  type: string;
  url: string;
  download_url: string | null;
}

export default function Command() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isShowingDetail, setIsShowingDetail] = useState(true);

  useEffect(() => {
    async function fetchFromGitHub() {
      try {
        // GitHub repo API endpoint for the conference directory
        const repoOwner = "ccfddl";
        const repoName = "ccf-deadlines";
        const conferenceDirPath = "conference";
        const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${conferenceDirPath}`;

        console.log("Fetching categories from GitHub:", apiUrl);

        const categoriesResponse = await fetch(apiUrl);
        if (!categoriesResponse.ok) {
          throw new Error(`GitHub API error: ${categoriesResponse.statusText}`);
        }

        const categories = (await categoriesResponse.json()) as GitHubContent[];
        const allItems: Item[] = [];

        // Process each category directory
        for (const category of categories) {
          if (category.type === "dir") {
            const categoryUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${category.path}`;
            console.log(`Fetching files from category: ${category.name}`);

            const filesResponse = await fetch(categoryUrl);
            if (!filesResponse.ok) {
              console.error(`Failed to fetch files for ${category.name}: ${filesResponse.statusText}`);
              continue;
            }

            const files = (await filesResponse.json()) as GitHubContent[];

            // Process each YAML file in the category
            for (const file of files) {
              if (file.name.endsWith(".yml") && file.download_url) {
                console.log(`Fetching YAML from: ${file.name}`);

                const yamlResponse = await fetch(file.download_url);
                if (!yamlResponse.ok) {
                  console.error(`Failed to fetch YAML for ${file.name}: ${yamlResponse.statusText}`);
                  continue;
                }

                const yamlText = await yamlResponse.text();
                try {
                  const yamlContent = yaml.load(yamlText) as Item[];
                  if (Array.isArray(yamlContent)) {
                    allItems.push(...yamlContent);
                  }
                } catch (yamlError) {
                  console.error(`Failed to parse YAML for ${file.name}:`, yamlError);
                }
              }
            }
          }
        }

        // Sort conferences within each item by year (descending)
        allItems.forEach((item) => {
          if (item.confs && Array.isArray(item.confs)) {
            item.confs.sort((a, b) => b.year - a.year);
          }
        });

        setItems(allItems);
        setLoading(false);
        console.log(`Loaded ${allItems.length} conferences from GitHub`);
      } catch (error) {
        console.error("Failed to load conference data from GitHub:", error);
        setLoading(false);
      }
    }

    fetchFromGitHub();
  }, []);

  return (
    <List
      isLoading={loading}
      isShowingDetail={isShowingDetail}
      searchBarPlaceholder="Search conferences..."
      throttle={true}
    >
      {items.map((item) => renderListItem(item, isShowingDetail, setIsShowingDetail))}
    </List>
  );
}

function renderListItem(item: Item, isShowingDetail: boolean, setIsShowingDetail: (showing: boolean) => void) {
  // Get the most recent conference
  const latestConf = item.confs?.[0];

  return (
    <List.Item
      key={item.title}
      icon={Icon.Calendar}
      title={item.title}
      subtitle={item.sub}
      accessories={[{ text: `CCF: ${item.rank.ccf}` }, { text: latestConf?.place || "Location unknown" }]}
      actions={
        <ActionPanel>
          {latestConf?.link && <Action.OpenInBrowser title="Open Conference Website" url={latestConf.link} />}
          <Action
            title="Toggle Detail View"
            icon={Icon.Eye}
            shortcut={{ modifiers: ["cmd"], key: "d" }}
            onAction={() => setIsShowingDetail(!isShowingDetail)}
          />
          <Action.CopyToClipboard
            title="Copy Conference Info"
            content={`${item.title}: ${item.description}`}
            shortcut={{ modifiers: ["cmd"], key: "c" }}
          />
        </ActionPanel>
      }
      detail={
        <List.Item.Detail
          markdown={`# ${item.title}\n\n${item.description}\n\n## Next Conference\n* **Date:** ${latestConf?.date || "Not announced"}\n* **Location:** ${latestConf?.place || "Not announced"}\n* **Deadline:** ${latestConf?.timeline?.[0]?.deadline || "Not announced"}\n* **Website:** ${latestConf?.link ? `[${latestConf.link}](${latestConf.link})` : "Not announced"}`}
          metadata={
            <List.Item.Detail.Metadata>
              <List.Item.Detail.Metadata.Label title="Conference" text={item.title} />
              <List.Item.Detail.Metadata.Label title="Description" text={item.description} />
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Category" text={item.sub} />
              <List.Item.Detail.Metadata.Label title="CCF Rank" text={item.rank.ccf || "N/A"} />
              <List.Item.Detail.Metadata.Label title="CORE Rank" text={item.rank.core || "N/A"} />
              <List.Item.Detail.Metadata.Label title="THCPL Rank" text={item.rank.thcpl || "N/A"} />
              {latestConf && (
                <>
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label title="Next Conference" text={`${latestConf.year}`} />
                  <List.Item.Detail.Metadata.Label
                    title="Next Deadline"
                    text={latestConf.timeline?.[0]?.deadline || "N/A"}
                  />
                  <List.Item.Detail.Metadata.Label title="Timezone" text={latestConf.timezone || "N/A"} />
                </>
              )}
            </List.Item.Detail.Metadata>
          }
        />
      }
    />
  );
}
