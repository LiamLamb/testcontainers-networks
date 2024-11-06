import {
  GenericContainer,
  getContainerRuntimeClient,
  Network,
} from "testcontainers";
import axios from "axios";

const runExp = async () => {
  console.log("Creating network a");
  const networkA = await new Network().start();

  console.log("Creating network b");
  const networkB = await new Network().start();

  console.log("Starting ping-pong container");
  const container = await new GenericContainer("briceburg/ping-pong")
    .withExposedPorts(80)
    .withNetwork(networkA)
    .start();

  const client = await getContainerRuntimeClient();
  const containerRef = client.container.getById(container.getId());
  const networkBRef = client.network.getById(networkB.getId());

  console.log("Connecting container to network b");

  // NOTE: Commenting out the following line stabilizes the behavior
  await client.container.connectToNetwork(containerRef, networkBRef, []);

  const mappedPort = container.getMappedPort(80);

  try {
    const response = await axios
      .create({
        baseURL: `http://localhost:${mappedPort}`,
      })
      .get("/ping");

    console.log(response.data);
  } catch (error: unknown) {
    console.error(error);

    const containerInfo = await client.container.inspect(containerRef);
    const port = containerInfo.NetworkSettings.Ports["80/tcp"][0].HostPort;

    console.log(`Expected port: ${port} vs actual port: ${mappedPort}`);
  }

  await container.stop();
  await networkA.stop();
  await networkB.stop();
};

async function main() {
  for (let i = 0; i < 10; i++) {
    console.log(`Run ${i + 1}`);

    await runExp();

    console.log("-".repeat(80));
  }
}

main();
