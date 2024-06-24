import net from "net";
import { readHeader, writeHeader } from "./utils.js";
import { HANDLER_ID, MAX_MESSAGE_LENGTH, TOTAL_LENGTH_SIZE } from "./constants.js";

const PORT = 5555;

const server = net.createServer((socket) =>
{
	console.log(`클라이언트가 연결되었습니다: ${socket.remoteAddress}:${socket.remotePort}`);

	socket.on("data", (data) =>
	{
		const buffer = Buffer.from(data); // 버퍼 객체의 메서드를 사용하기 위해 변환

		const { handlerId, length } = readHeader(buffer);
		console.log(`핸들러ID: ${handlerId}`);
		console.log(`길이: ${length}`);

		if (length > MAX_MESSAGE_LENGTH)
		{
			console.error(`에러: 메시지 길이 ${length}가 최대치 ${MAX_MESSAGE_LENGTH}를 초과합니다.`);
			socket.write('에러: 메시지가 너무 깁니다!');
			socket.end();
			return;
		}

		const headerSize = TOTAL_LENGTH_SIZE + HANDLER_ID;
		// 메시지 추출
		const message = buffer.slice(headerSize); // 앞의 헤더 부분을 잘라낸다.

		console.log(`클라이언트에게 받은 메세지: ${message}`);

		const responseMessage = "Hi!, There";
		const responseBuffer = Buffer.from(responseMessage);

		const header = writeHeader(responseBuffer.length, handlerId);
		const responsePacket = Buffer.concat([header, responseBuffer]);

		socket.write(responsePacket);
	});

	socket.on("end", () =>
	{
		console.log(`클라이언트 연결이 해제되었습니다: ${socket.remoteAddress}:${socket.remotePort}`);
	});

	socket.on("error", (err) =>
	{
		console.log(`소켓에서 에러가 발생했습니다: ${err}`);
	});
});

server.listen(PORT, () =>
{
	console.log(`에코 서버가 ${PORT}번 포트로 동작중입니다.`);
	console.log(server.address());
});