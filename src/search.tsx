import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useState } from "react";

interface Item {
  id: string;
  title: string;
  description: string;
}

export default function Command() {
  // Sample data - replace with your actual data
  const sampleItems = [
    { id: "1", title: "First Item", description: "Description of first item" },
    { id: "2", title: "Second Item", description: "Description of second item" },
    { id: "3", title: "Third Item", description: "Description of third item" },
  ];

  const [isShowingDetail, setIsShowingDetail] = useState(true);

  return (
    <List isShowingDetail={isShowingDetail} searchBarPlaceholder="Search items...">
      {sampleItems.map((item) => renderListItem(item, isShowingDetail, setIsShowingDetail))}
    </List>
  );
}

function renderListItem(item: Item, isShowingDetail: boolean, setIsShowingDetail: (showing: boolean) => void) {
  return (
    <List.Item
      key={item.id}
      icon={Icon.Document}
      title={item.title}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser title="Search Online" url={`https://www.google.com/search?q=${item.title}`} />
          <Action
            title="Toggle Detail View"
            icon={Icon.Eye}
            shortcut={{ modifiers: ["cmd"], key: "d" }}
            onAction={() => setIsShowingDetail(!isShowingDetail)}
          />
          <Action.CopyToClipboard
            title="Copy Description"
            content={item.description}
            shortcut={{ modifiers: ["cmd"], key: "c" }}
          />
        </ActionPanel>
      }
      detail={
        <List.Item.Detail
          markdown={`# ${item.title}\n\n${item.description}`}
          metadata={
            <List.Item.Detail.Metadata>
              <List.Item.Detail.Metadata.Label title="Title" text={item.title} />
              <List.Item.Detail.Metadata.Label title="Description" text={item.description} />
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="ID" text={item.id} />
            </List.Item.Detail.Metadata>
          }
        />
      }
    />
  );
}
